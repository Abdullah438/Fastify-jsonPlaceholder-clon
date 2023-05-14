/// <reference lib="dom" />
import { FastifyPluginAsync } from "fastify";


interface PostParams {
    id: String,
}

interface Post {
    userId: Number,
    id: Number,
    title: String,
    body: String,
}

interface PostsParams {
    limit: Number,
    start: Number,
}

const BASE_URL = "https://jsonplaceholder.typicode.com";

const posts: FastifyPluginAsync = async (fastify, _): Promise<void> => {

    //Retrieve all posts
    fastify.get<{ Querystring: PostsParams }>("/", {
        preParsing: async (request) => {
            if (request.query.limit === undefined) {
                request.query.limit = 10;
            }
            if (request.query.start === undefined) {
                request.query.start = 0;
            }
        }
    }, async (request, reply) => {
        const limit = Number(request.query.limit);
        const start = Number(request.query.start);
        await getPosts().then((posts) => {
            reply.send(posts.slice(start, start + limit));
        }).catch((err) => { reply.code(500).send(err.message) });
    });

    //Get single post.
    fastify.get<{
        Params: PostParams
    }>("/:id", async (request, reply) => {
        if (request.params.id === undefined) { reply.code(404).send({ message: "No post found" }) } else {
            await getPost(Number(request.params.id)).then((post) => {
                reply.send(post);
            })
        }
    })

    //Add new post
    fastify.post<{
        Body: Post,
    }>(
        "/",
        async (request, reply) => {
            await addPost(request.body).then((post) => {
                reply.send(post);
            }).catch((err) => { reply.code(500).send(err.message) });
        })

    //Delete post
    fastify.delete<{
        Params: PostParams,
    }>(
        "/:id",
        async (request, reply) => {
            await deletePost(Number(request.params.id)).then((post) => {
                reply.send({
                    deleted: true,
                });
            }).catch((error) => {
                reply.code(500).send({ message: error.message })
            })
        })

    //Update post
    fastify.patch<{
        Body: Post,
        Params: PostParams,
    }>(
        "/:id",
        async (request, reply) => {
            await updatePost(Number(request.params.id), request.body)
                .then((post) => {
                    reply.send(post);
                })
                .catch((error) => { reply.code(500).send({ message: error.message }) }
                );
        })
}

async function getPosts(): Promise<Post[]> {
    return await fetch(`${BASE_URL}/posts`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
        }).then(response => response.json()).then(function (data) {
            return data
        }).catch(error => {
            console.log(error)
        })
}
async function getPost(id: Number): Promise<Post[]> {
    return await fetch(`${BASE_URL}/posts/${id}`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
        }).then(response => response.json()).then(function (data) {
            return data
        }).catch(error => {
            throw error;
        })
}

async function addPost(post: Post): Promise<Post[]> {
    return await fetch(`${BASE_URL}/posts`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            title: post.title,
            body: post.body,
            userId: post.userId
        }),
    }).then(response => response.json()).then(function (data) {
        return data
    }).catch(error => {
        throw error;
    })
}

async function deletePost(id: Number): Promise<Post> {
    return await fetch(`${BASE_URL}/posts/${id}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
    }).then(response => response.json()).then(function (data) {
        return data
    }).catch(error => {
        throw error;
    })
}

async function updatePost(id: Number, post: Post): Promise<Post> {
    return await fetch(`${BASE_URL}/posts/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            title: post.title,
            body: post.body,
            userId: post.userId
        }),
    }).then(response => response.json()).then(function (data) {
        return data
    }).catch(error => {
        throw error;
    })
}

export default posts