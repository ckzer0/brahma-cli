export const registerAnythingElse = (cli) => {
  cli.action(() => {
    console.log(
      `Command provided to 'brahma' is either empty or incorrect.\n\nFor reference run 'brahma -h[or --help]'`
    );
  });
};
