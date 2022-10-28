import { useEffect, useState } from "react"
import DOMPurify from 'dompurify';

export default function ContentWithIcons(icons) {
    const [items, setItems] = useState([])
    const [desc, setDesc] = useState('')
    const [file, setFile] = useState('hi')

    async function findImagePath(url) {
        const response = await fetch(url);
        const img = await response.json();
        return img.data.attributes.uri.value.replace('public:/', 'https://dev-pref-nextj.pantheonsite.io/sites/default/files')
    }

    async function loadIcons(url) {
        const response = await fetch(url);
        const names = await response.json();
        const icons = [];
        for (const icon of names.data) {
            const data = await findImagePath(icon.relationships.field_icon.links.related.href);
            console.log(data);
            // setFile(data);
            icons.push({
                text: icon.attributes.field_icon_description,
                imgAlt: icon.relationships.field_icon.data.meta.alt,
                img: data
            });
        }
        return icons
    }

    const init = async () => {
        // setItems(icons.data);
        setDesc(DOMPurify.sanitize(icons.data.attributes.field_description.processed))
        const data = await loadIcons(icons.data.relationships.field_icon_items.links.related.href);
        console.log(data);
        setItems(data);
    }

    useEffect(() => {
        init()
    }, []);

    return (
        <section>
            <div>
                <h1>{icons.data.attributes.field_title}</h1>
                <p dangerouslySetInnerHTML={{ __html: desc }} />
            </div>
            <div className="icons" >
                {items.map((item, index) => {
                    return (<div key={'content-icon' + index}>
                        <img src={item.img} alt={item.imgAlt} />
                        <p>{item.text}</p>
                    </div>)
                })}

            </div>
        </section>
    )
}
