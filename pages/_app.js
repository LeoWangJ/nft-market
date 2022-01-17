import '../styles/globals.css'
import Link from 'next/link'

function Market({component,pageProps}){
  return (
    <div>
      <nav className="border-b p=6" style={{backgroundColor: 'purple'}}>
        <p className="text-4x1 front-bold text-while">Marketplace</p>
        <Link href="/">
          <a className="">

          </a>
        </Link>
      </nav>
    </div>
  )
}

export default Market