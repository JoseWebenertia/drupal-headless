import { NextSeo } from 'next-seo';
import { isMultiLanguage } from '../../lib/isMultiLanguage';
import { getPreview } from '../../lib/getPreview';
import {
	getCurrentLocaleStore,
	globalDrupalStateAuthStores,
	globalDrupalStateStores,
} from '../../lib/stores';

import Link from 'next/link';
import Layout from '../../components/layout';
import ContentWithIcons from '../../components/paragraphs/content-with-icons';
import TextWithImage from '../../components/paragraphs/text-with-image';
import { response } from 'msw';

export default function PageTemplate({ page, blades, footerMenu, hrefLang, preview }) {
	let bladeList = pageBuilder(blades.id, blades.data);

	return (
		<Layout preview={preview} footerMenu={footerMenu}>
			<NextSeo
				title="Decoupled Next Drupal Demo"
				description="Generated by create next app."
				languageAlternates={hrefLang}
			/>
			<article className="prose lg:prose-xl mt-10 mx-auto">
				<h1>{page.langcode}</h1>

				<Link passHref href="/pages">
					<a className="font-normal">Pages &rarr;</a>
				</Link>
				{bladeList.map((blade,index)=>{
					return(<div key={index}> {blade}</div>)
				})}
			</article>
		</Layout>
	);
}

function pageBuilder(id,data) {
	let blades = []
	data.map((blade,index) => {
		if(blade.type.replace('paragraph--','') === 'text_with_image' ){
			blades.push(<TextWithImage id={id} data={blade} order={index} />)
		}
		else{
			blades.push(<ContentWithIcons id={id} data={blade}  order={index} />)
		}
	})

	return blades
}



export async function getServerSideProps(context) {
	const { locales, locale } = context;
	const multiLanguage = isMultiLanguage(context.locales);
	const lang = context.preview ? context.previewData.previewLang : locale;
	const store = getCurrentLocaleStore(
		lang,
		context.preview ? globalDrupalStateAuthStores : globalDrupalStateStores,
	);

	// handle nested alias like /pages/featured
	const alias = `${context.params.alias
		.map((segment) => `/${segment}`)
		.join('')}`;

	const previewParams =
		context.preview && (await getPreview(context, 'node--page'));

	let page;
	try {
		page = await store.getObjectByPath({
			objectName: 'node--page',
			// note: pages are not prefixed by default.
			path: `${multiLanguage ? lang : ''}${alias}`,
			params: context.preview && previewParams,
			refresh: true,
			res: context.res,
		});
	} catch (error) {
		// retry the fetch with `/pages` prefix
		page = await store.getObjectByPath({
			objectName: 'node--page',
			// note: pages are not prefixed by default.
			path: `${multiLanguage ? lang : ''}/pages${alias}`,
			params: context.preview && previewParams,
			refresh: true,
			res: context.res,
		});
	}
	const bladeUrl = 'https://dev-pref-nextj.pantheonsite.io/jsonapi/node/page/' + page.id + '/field_sections'
	
	let blades;
	let pullJson = () =>{
		fetch(bladeUrl)
		.then(response => response.json())
		.then(responseData => {
			blades =responseData
		})
	}

	pullJson()
	

	const footerMenu = await store.getObject({
		objectName: 'menu_items--main',
		refresh: true,
		res: context.res,
	});

	const origin = process.env.NEXT_PUBLIC_FRONTEND_URL;
	// Load all the paths for the current page content type.
	const paths = locales.map(async (locale) => {
		const storeByLocales = getCurrentLocaleStore(
			locale,
			context.preview ? globalDrupalStateAuthStores : globalDrupalStateStores,
		);
		const { path } = await storeByLocales.getObject({
			objectName: 'node--page',
			id: page.id,
			params: context.preview && previewParams,
			refresh: true,
			res: context.res,
		});
		return path;
	});

	// Resolve all promises returned as part of paths
	// and prepare hrefLang.
	const hrefLang = await Promise.all(paths).then((values) => {
		return values.map((value) => {
			return {
				hrefLang: value.langcode,
				href: origin + '/' + value.langcode + value.alias,
			};
		});
	});

	return {
		props: {
			page,
			blades,
			footerMenu,
			hrefLang,
			preview: Boolean(context.preview),
		},
	};
}
