class Virtualizer {
  constructor() {
    console.log("virtualizer");
  }

  handleWheel = (e) => {
    console.log(e);
  };

  init() {
    window.addEventListener("wheel", this.handleWheel);
  }

  destroy() {
    window.removeEventListener("wheel", this.handleWheel);
  }
}

export default Virtualizer;
