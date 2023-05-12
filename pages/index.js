import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/Home.module.css';
import { getAllCategories } from '../utils/graphql';
import { useState } from 'react';

export async function getStaticProps() {
  const categories = await getAllCategories();
  return {
    props: { categories },
  };
}

function Product({ product }) {
  const formatPrice = new Intl.NumberFormat('en-US', {
    currency: 'USD',
  });

  return (
    <div className={styles.product}>
      <Link href={`/product/${product.slug}`}>
        <img src={product.imageSrc} alt={product.imageAlt} />
      </Link>
      <h2>{product.title}</h2>
      <p>{product.description}</p>
      <p className={styles.price}>{formatPrice.format(product.price)}</p>
    </div>
  );
}

function Category({ category, isOpen, onClick }) {
  const handleCategoryClick = () => {
    onClick(category.id);
  };

  return (
    <div className={styles.category}>
      <h2 onClick={handleCategoryClick}>{category.title}</h2>
      {isOpen && (
        <div className={styles.product}>
          {category.products.map((product) => (
            <Product key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Home({ categories }) {
  const [selectedCategoryId, setSelectedCategoryId] = useState(categories[0]?.id);

  const handleCategoryClick = (categoryId) => {
    setSelectedCategoryId(categoryId);
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <h1 className={styles.title}>Store</h1>
        <div className={styles.categoryContainer}>
          {categories.map((category) => (
            <Category
              key={category.id}
              category={category}
              isOpen={selectedCategoryId === category.id}
              onClick={handleCategoryClick}
            />
          ))}
        </div>
      </main>
    </div>
  );
}