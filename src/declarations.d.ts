declare module "*.css";
declare module "*.scss";
declare module "*.sass";

declare module "swiper/css";
declare module "swiper/css/pagination";

declare module "*.png" {
  const source: import("next/image").StaticImageData;
  export default source;
}

declare module "*.jpg" {
  const source: import("next/image").StaticImageData;
  export default source;
}

declare module "*.jpeg" {
  const source: import("next/image").StaticImageData;
  export default source;
}

declare module "*.svg" {
  const source: import("next/image").StaticImageData;
  export default source;
}

declare module "*.webp" {
  const source: import("next/image").StaticImageData;
  export default source;
}
