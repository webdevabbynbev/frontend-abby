import { BevPick, DataReview } from "@/data";
import { FaStar } from "react-icons/fa";
import { formatToRupiah, getDiscountPercent, slugify } from "@/utils";

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
  Chip,
} from "@/components";

export default function ProductDetail({ params }) {
  const { slug } = params;

  const allProducts = [...BevPick];
  const product = allProducts.find((p) => p.slug === slug);

  if (!product) {
    return (
      <div className="container w-full py-16 text-center">
        <h2 className="text-2xl font-bold">Product not found</h2>
      </div>
    );
  }

  const discount = product.realprice
    ? getDiscountPercent(product.realprice, product.price)
    : 0;

  BevPick.forEach((p) => {
    const expectedSlug = slugify(p.name);
    if (p.slug !== expectedSlug) {
      console.warn(`Mismatch di ID ${p.id}:
      name    = ${p.name}
      slug    = ${p.slug}
      expected= ${expectedSlug}
    `);
    }
  });
  return (
    <div className="container w-full py-6 px-16 flex">
      <div className="wrapper space-y-10 items-center justify-between">
        <div className="left-wrapper-content w-full flex-row space-y-10">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink
                  href={`/category/${product.brand?.toLowerCase()}`}
                >
                  {product.brand || "Category"}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{product.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="left-content w-full flex">
            <div className="Image-container">
              <div className="h-[220px] w-[220px] relative overflow-hidden rounded-lg">
                {product.sale && (
                  <img
                    src="/sale-tag.svg"
                    alt="Sale"
                    className="absolute top-0 left-0 z-10 w-[40px] h-auto"
                  />
                )}
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover border border-neutral-400"
                />
              </div>
              <div className="flex max-w-[300px] py-2 items-center space-x-4 max-h-64 overflow-x-auto custom-scrollbar">
                {[...Array(5)].map((_, i) => (
                  <img
                    key={i}
                    src={product.image}
                    alt={`${product.name}-${i}`}
                    className="h-[50px] w-[50px] border p-2 rounded-md"
                  />
                ))}
              </div>
            </div>

            <div className="Content-right w-full space-y-4 px-10">
              <div className="title-product">
                <h1 className="text-lg font-bold">{product.brand}</h1>
                <h2 className="text-xl font-normal">{product.name}</h2>
              </div>

              <div className="price space-y-2">
                <div className="finalPrice">
                  <span className="text-primary-700 text-2xl font-bold">
                    {formatToRupiah(product.price)}
                  </span>
                </div>

                <div className="reapPrice-container flex space-x-2 items-center">
                  <span className="text-base font-medium text-neutral-400 line-through">
                    {formatToRupiah(product.realprice)}
                  </span>
                  <span className="text-[10px] py-1 px-3 bg-primary-200 w-fit rounded-full text-primary-700 font-bold">
                    {discount > 0 && <span>{discount}% off</span>}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="flex items-center text-primary-700 font-bold">
                  {product.rating}
                  <FaStar className="text-warning-300" />
                </span>

                <span className="text-neutral-400">
                  {`(${product.total_review} reviews)`}
                </span>
              </div>

              <div className="chip-container flex w-full space-x-3 items-center">
                <p>{product.variant_value} variant:</p>
                {product.variant.map((v, i) => (
                  <Chip key={i}>{v}</Chip>
                ))}
              </div>

              <hr className="w-full border-t border-neutral-200 my-4" />

              <div className="product-detail space-y-4">
                <div className="summary space-y-2">
                  <h3 className="text-primary-700 font-bold text-base">
                    Summary
                  </h3>
                  <div className="product-detail">
                    <p className="text-sm">{product.description}</p>
                  </div>
                </div>
                <div className="shipment space-y-2">
                  <h3 className="text-primary-700 font-bold text-base">
                    Shipment
                  </h3>
                  <p className="text-sm">
                    Regular shipment start from
                    <span className="font-bold"> Rp.10.000</span>
                  </p>
                  <p className="text-sm">
                    Estimated time arrived
                    <span className="font-bold"> 3-5 days</span>
                    <span className="text-neutral-300"> | </span>
                    <span className="text-primary-700 font-medium">
                      See our shipping partner
                    </span>
                  </p>
                </div>
                <div className="review">
                  <h3 className="text-primary-700 font-bold text-base">
                    Review
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="sticky top-26 bot-32 items-start w-full max-w-[300px] h-[100px] bg-primary-700"></div>
    </div>
  );
}
