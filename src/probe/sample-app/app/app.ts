import { m } from "@ckzero/maya/web";

const HomePage = () => {
  return m.Div({
    children: [
      m.H1({
        innerText: "My first maya app",
      }),
      m.A({
        href: "https://www.google.com/search?q=maya.ui",
        innerText: "google Maya from more info",
      }),
    ],
  });
};

export const app = HomePage;
