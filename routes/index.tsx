// routes/index.tsx
import { Head } from "$fresh/runtime.ts";
import ShaderCanvas from "../islands/ShaderCanvas.tsx";

export default function Home() {
  return (
    <>
      <Head>
        <title>Dual Shader Demo</title>
      </Head>
      <div class="p-4 mx-auto max-w-6xl">
        <h1 class="text-2xl font-bold mb-4 text-center">Dual Shader Demo</h1>
        <div class="flex gap-4 justify-center">
          <ShaderCanvas />
          <ShaderCanvas />
        </div>
      </div>
    </>
  );
}
