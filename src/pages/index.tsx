import { type NextPage } from "next";
import Head from "next/head";
import Game from "./components/Game";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>F1 game</title>
        <meta name="description" content="A fun online f1 game" />
      </Head>
      <Game />
    </>
  )
};

export default Home;
