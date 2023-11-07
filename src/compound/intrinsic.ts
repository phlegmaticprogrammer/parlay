declare global {
    namespace JSX {
        interface IntrinsicElements {
          "c-cool": {
            ids? : number
            //id: string;
          };
        }
    }
}