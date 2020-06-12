export default function readFile(file) {
  return new Promise((resolve) => {
    let reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => {
      resolve(reader.result);
    };
  });
}
