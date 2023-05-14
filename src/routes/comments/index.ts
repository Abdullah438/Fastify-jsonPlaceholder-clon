/// <reference lib="dom" />
import { FastifyPluginAsync } from "fastify";

interface Comment {
    userId: Number;
    id: Number;
    name: String;
    email: String;
    body: String
}
interface CommentsQuery {
    postId: Number;
    limit: Number;
    start: Number;
}

const BASE_URL = "https://jsonplaceholder.typicode.com"
const comments: FastifyPluginAsync = async (fastify, _): Promise<void> => {
    //Get comments bases on [postId].
    fastify.get<{ Querystring: CommentsQuery }>('/', {
        preParsing: async (request, reply) => {
            if (request.query.start === undefined) {
                request.query.start = 0;
            }
            if (request.query.limit === undefined) {
                request.query.limit = 10;
            }
        }
    }, async (request, reply) => {
        const postId = Number(request.query.postId);
        const limit = Number(request.query.limit);
        const start = Number(request.query.start);
        await getComments(Number(postId)).then(comments =>
            reply.send(comments.slice(start, start + limit))).catch(e => reply.code(500).send(e));
    })
}

async function getComments(postId: Number): Promise<Comment[]> {
    return await fetch(`${BASE_URL}/comments?postId=${postId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
    }).then(res => res.json()).then(function (data) { return data }).catch(err => {
        throw err;
    });
}

export default comments;