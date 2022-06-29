import "../styles/globals.css";
import type { AppProps } from "next/app";
import Link from "next/link";
import { Fragment } from "react";
import "nprogress/nprogress.css";
import Navbar from "../components/Navbar";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Fragment>
      <Navbar />
      <Component {...pageProps} />
    </Fragment>
  );
}

export default MyApp;
