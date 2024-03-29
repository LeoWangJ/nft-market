import "../styles/globals.css";
import "./app.css";
import Link from "next/link";

function Market({ Component, pageProps }) {
  return (
    <div>
      <nav className="border-b p-6 bg-[#005b80]">
        <p className="text-4x1 font-bold text-white">Mini Marketplace</p>
        <div className="flex mt-4 justify-center ">
          <Link href="/">
            <a className="mr-4">Marketplace</a>
          </Link>
          <Link href="/mint-item">
            <a className="mr-6">Mint Tokens</a>
          </Link>
          <Link href="/my-nfts">
            <a className="mr-6">My NFts</a>
          </Link>
          <Link href="/account-dashboard">
            <a className="mr-6">Minted</a>
          </Link>
        </div>
      </nav>
      <Component {...pageProps} />
    </div>
  );
}

export default Market;
