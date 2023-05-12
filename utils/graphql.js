import { postToShopify } from './shopify';

export async function getAllCategories() {
  const data = await postToShopify({
    query: `
      query getAllCategories {
        collections(first: 100) {
          edges {
            node {
              id
              title
              products(first: 100) {
                edges {
                  node {
                    id
                    title
                    description
                    handle
                    images(first: 1) {
                      edges {
                        node {
                          src
                          altText
                        }
                      }
                    }
                    variants(first: 1) {
                      edges {
                        node {
                          priceV2 {
                            amount
                            currencyCode
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `,
    variables: {},
  });

  const categories = {};

  data.collections.edges.forEach(({ node }) => {
    if (node.products.edges.length > 0) {
      categories[node.id] = {
        id: node.id,
        title: node.title,
        products: node.products.edges.map(({ node: product }) => ({
          id: product.id,
          title: product.title,
          description: product.description,
          imageSrc: product.images.edges[0]?.node?.src ?? '/placeholder-image.jpg',
          imageAlt: product.images.edges[0]?.node?.altText ?? '',
          price: product.variants.edges[0]?.node?.priceV2?.amount ?? 0,
          slug: product.handle,
        })),
      };
    }
  });

  return Object.values(categories);
}


export async function getProductsByCategory(categoryId) {
  try {
    const data = await postToShopify({
      query: `
        query getProductsByCategory($categoryId: ID!) {
          collection(id: $categoryId) {
            id
            title
            products(first: 100) {
              edges {
                node {
                  id
                  title
                  description
                  handle
                  images(first: 1) {
                    edges {
                      node {
                        src
                        altText
                      }
                    }
                  }
                  variants(first: 1) {
                    edges {
                      node {
                        priceV2 {
                          amount
                          currencyCode
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `,
      variables: { categoryId },
    });

    if (!data.collection) {
      return [];
    }

    return data.collection.products.edges.map(({ node: product }) => ({
      id: product.id,
      title: product.title,
      description: product.description,
      imageSrc: product.images.edges[0]?.node?.src ?? '/placeholder-image.jpg',
      imageAlt: product.images.edges[0]?.node?.altText ?? '',
      price: product.variants.edges[0]?.node?.priceV2?.amount ?? 0,
      slug: product.handle,
    }));
  } catch (error) {
    console.log(error);
    return [];
  }
}
