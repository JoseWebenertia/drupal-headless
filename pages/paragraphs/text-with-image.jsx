import { useEffect, useState } from "react"

export default function TextWithImage(icon){
    const [items,setItems] = useState()

    async function loadBlades() {
        const response = await  fetch( 'https://dev-pref-nextj.pantheonsite.io/jsonapi/node/page/ce420a9f-5b25-4ce6-aed5-6673a3291eab/field_sections');
        const names = await response.json();
        return names; 
    }

    useEffect(() =>{
        setItems(loadBlades());
    },[])

    return (
        <section>
            <div>
                <h1>text</h1>
                <img src="/pantheon.png" alt="img" />
            </div>
        </section>
    )
}
