import * as fs from 'node:fs'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { useState } from 'react'

const countFilePath = 'count.txt';
const stepFilePath = 'step.txt';

async function readCount() {
  return parseInt(
    await fs.promises.readFile(countFilePath, 'utf-8').catch(() => '0'),
  );
}

async function readStep() {
  return parseInt(
    await fs.promises.readFile(stepFilePath, 'utf-8').catch(() => '1'),
  );
}

const getCountAndStep = createServerFn({
  method: 'GET',
}).handler(async () => {
  const [count, step] = await Promise.all([readCount(), readStep()]);
  return { count, step };
});

const updateCount = createServerFn({ method: 'POST' })
  .validator((d: number) => d)
  .handler(async ({ data }) => {
    const count = await readCount();
    await fs.promises.writeFile(countFilePath, `${count + data}`);
  });

const updateStep = createServerFn({ method: 'POST' })
  .validator((d: number) => d)
  .handler(async ({ data }) => {
    await fs.promises.writeFile(stepFilePath, `${data}`);
  });

export const Route = createFileRoute('/dashboard/demo/start/server-funcs')({
  component: Home,
  loader: async () => await getCountAndStep(),
});

function Home() {
  const router = useRouter();
  const { count, step: serverStep } = Route.useLoaderData();
  const [step, setStep] = useState(serverStep);

  // When step changes, persist it on the server
  function handleStepChange(newStep: number) {
    setStep(newStep);
    updateStep({ data: newStep });
  }

  return (
    <div className="p-4 flex flex-col gap-4 max-w-xs">
      <div className="flex items-center gap-2">
        <span>Change by:</span>
        <button
          type="button"
          className="px-2 py-1 bg-gray-200 rounded"
          onClick={() => handleStepChange(Math.max(1, step - 1))}
        >
          -
        </button>
        <input
          type="number"
          min={1}
          value={step}
          onChange={e => handleStepChange(Math.max(1, Number(e.target.value)))}
          className="w-14 p-1 border rounded text-center"
        />
        <button
          type="button"
          className="px-2 py-1 bg-gray-200 rounded"
          onClick={() => handleStepChange(step + 1)}
        >
          +
        </button>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            updateCount({ data: step }).then(() => {
              router.invalidate();
            });
          }}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex-1"
        >
          Add {step} to {count}
        </button>
        <button
          type="button"
          onClick={() => {
            updateCount({ data: -step }).then(() => {
              router.invalidate();
            });
          }}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded flex-1"
        >
          Subtract {step} from {count}
        </button>
      </div>
      <div className="mt-2 text-gray-600">Current count: <span className="font-mono font-bold">{count}</span></div>
    </div>
  );
}
