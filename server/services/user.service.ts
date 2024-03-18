import type { Context, Service, ServiceSchema } from "moleculer";
import type { DbAdapter, DbServiceSettings, MoleculerDbMethods } from "moleculer-db";
import type MongoDbAdapter from "moleculer-db-adapter-mongo";
import type { DbServiceMethods } from "../mixins/db.mixin";
import DbMixin from "../mixins/db.mixin";
import { time } from "console";
import mongoose, { Date } from "mongoose";

const { MoleculerClientError } = require("moleculer").Errors;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors=require('cors');

export interface UserEntity {
	_id: string;
	name:string,
    email:string,
    password:string,
}

export type ActionCreateParams = Partial<UserEntity>;

export interface ActionAllUserParams {
	emailid:string,
}

interface UserSetting extends DbServiceSettings {
	indexes?: Record<string, number>[];
}

interface UserThis extends Service<UserSetting>, MoleculerDbMethods {
	adapter: DbAdapter | MongoDbAdapter;
}

interface FilterOptions {
    [key: string]: any;
}


const ChatService: ServiceSchema<UserSetting> & { methods: DbServiceMethods } = {
	name: "users",
	mixins: [DbMixin("users")],


	settings: {
		fields: ["_id", "name", "email", "password"],
        entityValidator: {
			name: { type: "string", min: 2, pattern: /^[a-zA-Z0-9]+ [a-zA-Z0-9]+$/ },
			email: { type: "email" },
			password: { type: "string", min: 6 }
		},

		
	},

	actions: {
        signup:{
			rest:"POST /signup",
			async handler(ctx:Context<UserEntity>) {
				let entity = ctx.params;
				return this.validateEntity(entity)
					.then(() => {
						if (entity.email)
							return this.adapter.findOne({ email: entity.email })
								.then((found:UserEntity) => {
									if (found)
										return Promise.reject(new MoleculerClientError("User is exist!", 422, "", [{ field: "email", message: "is exist"}]));
									
								});
					})
					.then(() => {
						if (entity.email)
							return this.adapter.findOne({ email: entity.email })
								.then((found:UserEntity) => {
									if (found)
										return Promise.reject(new MoleculerClientError("Email is exist!", 422, "", [{ field: "email", message: "is exist"}]));
								});
							
					})
					.then( () => {
						entity.password = bcrypt.hashSync(entity.password, 10);
						// entity.createdAt = new Date();
						const user=entity;
						const token= jwt.sign(entity, process.env.JWT_SECRET);
						console.log(user);
						return this.adapter.insert(entity)
							.then((doc:UserEntity) =>{ return {user:doc,token:token};})
							// .then(user => this.transformEntity(user, true, ctx.meta.token))
							// .then(json => this.entityChanged("created", json, ctx).then(() => json));					
					});
			}
		},

        login: {
			rest: {
				method: "POST",
				path: "/login"
			},
			handler(ctx) {
				let entity = ctx.params;
				if (entity.email)
					return this.adapter.findOne({ email: entity.email })
						.then((found:UserEntity) => {
							const checkPassword = bcrypt.compare(entity.password, found.password);
							if (!checkPassword) {
								return Promise.reject(new MoleculerClientError("Invalid Email or Password!", 422, ""));
							}
							return { user: found, token: jwt.sign(entity, process.env.JWT_SECRET) };
						});
			}
		},
        all: {
            rest: "GET /allusers",
            params: {
                emailid: "string"
            },
            async handler(this: UserThis, ctx: Context<ActionAllUserParams>): Promise<object> {
                const filterOptions = {
                    query: {
                        email: { $ne: ctx.params.emailid }
                    }
                };
                const docs = await this.adapter.find(filterOptions);
                return {users:docs};
            }
        },
        

	},

	methods: {
		
	},

	async afterConnected(this: UserThis) {
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
