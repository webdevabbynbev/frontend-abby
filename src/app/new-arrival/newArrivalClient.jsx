"use client";

import { Fragment } from "react";
import { LoadingSpinner, NewArrivaleCard } from "@/components";

export default function NewArrivalClient({ products = [] }) {

  for (let i = 0; i < products.length; i += 5) {
    sections.push(products.slice(i, i + 5));
  }

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      <h1 className="sr-only">
        Produk baru sudah ready di beauty store Abby n Bev! Yuk, cek sekarang!
      </h1>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-neutral-900 mb-1">
          New arrivals
        </h2>
        <p className="text-sm text-neutral-500">
          Produk-produk terbaru yang baru saja hadir di Abby N Bev.
        </p>
      </div>

      {products.length === 0 ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 auto-rows-fr grid-flow-dense">
          {sections.map((group, index) => {
            const isFullSection = group.length === 5;
            const hero = isFullSection ? group[0] : null;
            const rest = isFullSection ? group.slice(1) : group;
            const isHeroLeft = index % 2 === 0;

            return (
              <Fragment key={index}>
                {isHeroLeft && hero && (
                  <div className="col-span-2 row-span-2">
                    <NewArrivaleCard product={hero} />
                  </div>
                )}

                {rest.map((product) => (
                  <div
                    key={product.id}
                    className="rounded-xl border border-neutral-200 hover:shadow-sm transition-shadow overflow-hidden"
                  >
                    <NewArrivaleCard product={product} />
                  </div>
                ))}

                {!isHeroLeft && hero && (
                  <div className="col-span-2 row-span-2">
                    <NewArrivaleCard product={hero} />
                  </div>
                )}
              </Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
}
