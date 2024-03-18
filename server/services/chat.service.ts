import type { Context, Service, ServiceSchema } from "moleculer";
import type { DbAdapter, DbServiceSettings, MoleculerDbMethods } from "moleculer-db";
import type MongoDbAdapter from "moleculer-db-adapter-mongo";
import type { DbServiceMethods } from "../mixins/db.mixin";
import DbMixin from "../mixins/db.mixin";
import { StringCodec, connect } from "nats.ws";
import { UserEntity } from "./user.service";
globalThis.WebSocket = require("websocket").w3cwebsocket;

export interface ChatEntity {
	_id: string;
	senderUserId: string;
	receiverUserId: string;
	message: string;
	createdAt: string;
}

export type ActionCreateParams = Partial<ChatEntity>;

export interface ActionChatParams {
	senderUserId: "string";
	receiverUserId: "string";
}

interface ChatSettings extends DbServiceSettings {
	indexes?: Record<string, number>[];
}

interface ChatsThis extends Service<ChatSettings>, MoleculerDbMethods {
	adapter: DbAdapter | MongoDbAdapter;
}

function Sort(a: ChatEntity, b: ChatEntity): boolean {
	return a.createdAt < b.createdAt;
}
const ChatService: ServiceSchema<ChatSettings> & { methods: DbServiceMethods } = {
	name: "chat",

	mixins: [DbMixin("chats")],

	settings: {
		fields: ["_id", "senderUserId", "receiverUserId", "message"],
	},

	actions: {
		getMessages: {
			rest: "GET /getmessages",
			params: {
				senderUserId: "string",
				receiverUserId: "string",
			},
			async handler(this: ChatsThis, ctx: Context<ActionChatParams>): Promise<object> {
				const doc = await this.adapter.find({
					query: {
						$or: [
							{
								$and: [
									{ senderUserId: ctx.params.senderUserId },
									{ receiverUserId: ctx.params.receiverUserId },
								],
							},
							{
								$and: [
									{ senderUserId: ctx.params.receiverUserId },
									{ receiverUserId: ctx.params.senderUserId },
								],
							},
						],
					},
				});
				return { messages: doc };
			},
		},
	},

	methods: {
		async handleIncomingMessages() {
			const subscription = this.nc.subscribe("chat.*");
			for await (const m of subscription) {
				const decodedMessage = StringCodec().decode(m.data);
				const { senderUserId, receiverUserId, message } = JSON.parse(decodedMessage);
				await this.adapter.insert({ senderUserId, receiverUserId, message });
			}
		},
	},

	created() {},

	async started() {
		this.nc = await connect({
			servers: ["ws://localhost:5050"],
		});

		this.subscription = this.nc.subscribe("chat.*");
		(async () => {
			for await (const m of this.subscription) {
				const decodedMessage = StringCodec().decode(m.data);
				const { senderUserId, receiverUserId, message } = JSON.parse(decodedMessage);
				await this.adapter.insert({
					senderUserId,
					receiverUserId,
					message,
					createdAt: new Date(),
				});
			}
		})();
	},

	async stopped() {},
	async afterConnected(this: ChatsThis) {
		if ("collection" in this.adapter) {
			if (this.settings.indexes) {
				await Promise.all(
					this.settings.indexes.map((index) =>
						(<MongoDbAdapter>this.adapter).collection.createIndex(index),
					),
				);
			}
		}
	},
};

export default ChatService;
