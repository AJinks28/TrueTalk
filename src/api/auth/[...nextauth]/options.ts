import { NextAuthOptions } from "next-auth";
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";


//syntax from nextjs docs-> provider->credentials 
export const authOptions: NextAuthOptions = {
    //
    providers: [
        CredentialsProvider({
            id: "credentials", //not so imp
            name: "Credentials", //not so imp
            credentials: { //imp
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
            },
            //	We define custom method called authorize to authenticate the user
            async authorize(credentials: any): Promise<any> {
                await dbConnect();
                try {
                    const user = await UserModel.findOne({
                        $or: [//find by either email or username
                            { email: credentials.identifier },
                            { username: credentials.identifier }
                        ]
                    });
                    if (!user) {
                        throw new Error("User not found")
                    }

                    if (!user.isVerified) {
                        throw new Error("User is not verified")
                    }

                    const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password)

                    if (!isPasswordCorrect) {
                        throw new Error("Password is incorrect")
                    } else {
                        return user;
                    }
                } catch (err: any) {
                    throw new Error(err)
                }
            }


        })
    ],

    //the callbacks configuration allows you to customize the behavior of various authentication-related processes. The jwt and session callbacks are specifically used to manage and customize the data stored in the JSON Web Token and the session object.
    callbacks: {
        //jwt callback is called whenever a JSON Web Token is created or updated. It allows you to modify the token before it is sent to the client or saved in the database.
        async jwt({ token, user }) {
            if (user) {
                //adding values in token
                token._id = user._id?.toString();
                token.isVerified = user.isVerified
                token.isAcceptingMessages = user.isAcceptingMessages
                token.username = user.username
            }

            return token
        },
        //session callback is called whenever a session object is created or updated. It allows you to modify the session object that is sent to the client.
        async session({ session, token }) {
            if (token) {
                session.user._id = token._id;
                session.user.isVerified = token.isVerified;
                session.user.isAcceptingMessages = token.isAcceptingMessages;
                session.user.username = token.username;
            }

            return session
        },

    },

    //pages allows you to define custom URLs for different authentication pages.
    //Also by defining pages , nextauth is not just creating route for the page but also design the page by itself
    pages: {
        //By default, NextAuth.js provides its own sign-in page, but if you want to create a custom sign-in page, you can specify its URL here.
        //when a user needs to sign in, they will be redirected to this custom page instead of the default NextAuth.js sign-in page.
        signIn: '/sign-in'
    },

    //session allows you to specify how user sessions are managed. Here it specifies that NextAuth.js should use JSON Web Tokens (JWT) for session management.
    session: {
        strategy: "jwt"
    },

    secret: process.env.NEXTAUTH_SECRET

}