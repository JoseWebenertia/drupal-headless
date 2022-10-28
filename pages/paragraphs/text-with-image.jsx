import DOMPurify from 'dompurify';
import { useEffect, useState } from "react"

export default function TextWithImage(props){
    const [img,setImg] = useState()
    const [alt,setAlt] = useState()
    const [desc, setDesc] = useState('')

    async function findImagePath(url) {
        const response = await fetch(url);
        const img = await response.json();
        return img.data.attributes.uri.value.replace('public:/', 'https://dev-pref-nextj.pantheonsite.io/sites/default/files')
    }

    const init = async() => {
        setDesc(DOMPurify.sanitize(props.data.attributes.field_description.processed))
        setAlt(props.data.relationships.field_image.data.meta.alt)
        const file = await findImagePath(props.data.relationships.field_image.links.related.href) 
        setImg(file)   
    }
    useEffect(() =>{
        init()
    },[])

    return (
        <section>
            <div>
            <p dangerouslySetInnerHTML={{ __html: desc }} />
            </div>
            <div>
                <img src={img} alt={alt} />
            </div>
        </section>
    )
}
