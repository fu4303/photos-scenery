import config from '../../config/config'
import path from 'path'
import sharp from 'sharp'
const PATH_TO_WEBP_IMAGES = path.join(config.root_path,'public','webp_images')

async function generate_thumbnail(image_src: Buffer | string,image_id:number){  //buffer or path to the image
  const metadata = await sharp(image_src).metadata()
            if(metadata && metadata.height && metadata.width){
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const x:any ={}
                if(metadata.width>metadata.height){
                    x.width=Math.min(metadata.width,750)
                }else if(metadata.width<metadata.height){
                    x.height=Math.min(metadata.height,750)
                }else{
                    x.width=Math.min(metadata.width,750)
                }
                const data = await sharp(image_src).resize(x)
                .webp({ quality: 80, reductionEffort: 6 })
                .toFile(`${PATH_TO_WEBP_IMAGES}/${image_id}.webp`);
            console.log(data)
            }
}
export default {generate_thumbnail}