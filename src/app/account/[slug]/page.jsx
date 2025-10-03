import AccountTabs from "../AccountTabs";

export default function AccountPage({ params, className }) {
  const {slug} = params;
  const allowed = ['profile', 'my-order', 'wishlist'];
  const safeSlug = allowed.includes(slug) ? slug : 'profile';

  return (
  <div className="container w-full py-6 px-10 flex">
  <AccountTabs slug={safeSlug} className="w-full" />
  </div>
  )
}