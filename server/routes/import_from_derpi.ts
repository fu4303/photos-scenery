/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-var-requires */
import db_ops from './../helpers/db_ops'
import { Request, Response } from 'express';
import axios from 'axios'
import fs from 'fs'
import path from 'path';
const imghash: any = require('imghash');
const PATH_TO_IMAGES = path.join(process.cwd(), 'public', 'images')
async function parse_author(tags: any) {
    for (const tag of tags) {
        const idx = tag.indexOf("artist:")
        if (idx === 0) {    //tag starts with "artist:" 
            return tag.slice(7) //strip off "artist:" 
        }
    }
    return "???"
}

async function import_from_derpi(req: Request, res: Response) {
    const id = parseInt(req.body.id);
    const ALLOWED_FORMATS = ["png", 'jpg', "jpeg"]
    if (req.session?.user_id) {
        const user = await db_ops.activated_user.find_user_by_id(req.session?.user_id)
        if (user[0].isAdmin) {
            try {
                const imgs = await db_ops.image_ops.find_image_by_id(id)
                if (imgs.length !== 0) {
                    res.json({ message: "Already in the DB" })
                    return
                }
                const response = await axios.get(`https://www.derpibooru.org/api/v1/json/images/${id}`,{ headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36' }  });
                const derpi_data = response.data.image
                if (!ALLOWED_FORMATS.includes(derpi_data.format.toLowerCase())) {
                    res.json({ message: "format is not in allowed formats" })
                    return
                }
                const image =await axios.get(derpi_data.representations.full, {responseType: 'arraybuffer'})
                const image_id = (await db_ops.image_ops.get_max_image_id())+1
                fs.writeFile(`${PATH_TO_IMAGES}/${image_id}.${derpi_data.format.toLowerCase()}`, image.data, 'binary', function (err) {
                    if (err) {
                        console.log(`There was an error writing the image: derpi_id: ${id} id: ${image_id}`)
                    }
                });           
                const parsed_author = await parse_author(derpi_data.tags)
                const derpi_link = "https://derpibooru.org/images/" + derpi_data.id
                const phash = await imghash.hash(image, 16);
                await db_ops.image_ops.add_image(image_id, derpi_data.format.toLowerCase(), derpi_data.width, derpi_data.height, parsed_author, derpi_data.size,
                    derpi_link, derpi_data.upvotes, derpi_data.downvotes, derpi_data.id, derpi_data.created_at,
                    derpi_data.source_url, derpi_data.tags, derpi_data.wilson_score, derpi_data.sha512_hash, phash, derpi_data.description)
                res.json({ message: `OK. New image_id: ${image_id}`})
                return
            } catch (error) {
                console.error(error);
            }

        }
    }
    res.sendStatus(404);
}

export default import_from_derpi;