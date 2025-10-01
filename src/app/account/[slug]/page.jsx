import AccountTabs from "../AccountTabs";

export default function AccountPage({ params }) {
  const {slug} = params;

  return (
  <div className="container w-full py-6 px-10 flex">
  <AccountTabs slug={slug} className="w-full" />;
  </div>
  )
}