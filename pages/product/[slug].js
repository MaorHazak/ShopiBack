import Head from 'next/head'
import Image from 'next/image'
import styles from '../../styles/Home.module.css'
import Link from 'next/link';
import { createCheckout, postToShopify } from '../../utils/shopifyQueries';
import { useRouter } from 'next/router';

export async function getStaticPaths() {


    const url = new URL(process.env.URL || 'http://localhost:3000');
    url.pathname = '/api/products';

    const res = await fetch(url.toString());

    if (!res.ok) {
        console.error(res);
        return { props: {} };
    }

    const data = await res.json();

    return {
        paths: data.products.edges.map(({ node }) => `/product/${node.handle}`),
        fallback: true,

    }
}

export async function getStaticProps({ params }) {

    const url = new URL(process.env.URL || 'http://localhost:3000');
    url.pathname = '/api/products';
    const res = await fetch(url.toString());

    if (!res.ok) {
        console.error(res);
        return { props: {} };
    }

    const data = await res.json();

    const product = data.products.edges
        .map(({ node }) => {
            if (node.totalInventory <= 0) {
                return false;
            }
            return {
                id: node.id,
                title: node.title,
                description: node.description,
                imageSrc: node.images.edges[0].node.src,
                imageAlt: node.title,
                price: node.variants.edges[0].node.priceV2.amount,
                slug: node.handle,
                variantId: node.variants.edges[0].node.id // Add this line to assign the variantId to the product object
            }
        })
        .find(({ slug }) => slug === params.slug);
    console.log('product variantId:', product.variantId);

    return {
        props: { product },
    };
}


function Product({ product, imageAlt, imageSrc, title, description, price }) {

    if (!product) {
        return null;
    }

    const formatPrice = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    });

    return (
        <div className={styles.product}>
            <a href={`/product/${product.slug}`}>
                <img src={imageSrc} alt={imageAlt} />
            </a>
            <h2>{title}</h2>
            <p>{description}</p>
            <p className={styles.price}>{formatPrice.format(price)}</p>
        </div>
    )
}

export default function ProductPage({ product }) {
    // console.log('product:', product); work
    const router = useRouter();

    const formatPrice = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    });

    const handleCheckout = async (variantId, quantity, product) => {
        console.log('variantId:', variantId);
        console.log('quantity:', quantity);
        console.log('Product:', product);
        const input = {
            lineItems: [{ variantId, quantity }],
        };

        const result = await postToShopify({
            query: createCheckout.loc.source.body,
            variables: { input },
        });

        console.log('Checkout result:', result);
        // work

        if (
            result &&
            result.checkoutCreate &&
            result.checkoutCreate.checkout
        ) {
            const checkoutUrl = result.checkoutCreate.checkout.webUrl;
            // Redirect user to the checkout URL or perform any other action
            window.location.href = checkoutUrl;
        }
    };

    if (router.isFallback) {
        return <div>Loading...</div>;
    }

    if (!product) {
        return <div>Product not found.</div>;
    }

    return (
        <div className={styles.container}>
            <Head>
                <title>{product.title}</title>
                <meta name="description" content={product.description} />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className={styles.main}>
                <h1 className={styles.title}>Store</h1>
                <Link href="/">&larr; back home</Link>
                <div className={styles.products}>
                    <div className={styles.product}>
                        <Link href={`/product/${product.slug}`}>
                            <img src={product.imageSrc} alt={product.imageAlt} />
                        </Link>
                        <h2>{product.title}</h2>
                        <p>{product.description}</p>
                        <p className={styles.price}>
                            {formatPrice.format(product.price)}
                        </p>
                    </div>
                    <button onClick={() => {


                        // console.log('Product:', product); work
                        handleCheckout(product.variantId, 1, product)
                    }}>
                        Buy now!
                    </button>
                </div>
            </main>
        </div>
    );
}
