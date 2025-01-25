import React from 'react';
import ConfirmDialog from './ConfirmDialog';
import mountComponent from '@/app/components/utilComponents/mounter.tsx';

export async function confirm(
  message: React.ReactNode,
  options?: {confirmMessage?: string; cancelMessage?: string}
): Promise<HTMLElement | boolean | null> {
  return await mountComponent(ConfirmDialog, {
    ...options,
    message: message,
  });
}

export interface ConfirmInputType {
  name: string;
  label: string;
  value: string;
}

export async function confirmInput(
  inputs: ConfirmInputType[],
  options?: {confirmMessage?: string; cancelMessage?: string}
): Promise<HTMLElement | boolean | null> {
  const inputElements = (
    <div className='flex flex-col w-full'>
      {inputs.map((input) => (
        <div key={input.name} className='flex flex-row w-full justify-between'>
          <label htmlFor={input.name} className='w-1/3 content-center'>
            {input.label}:
          </label>
          <input
            type='text'
            defaultValue={input.value}
            name={input.name}
            id={input.name}
            className='folder h-8 w-2/3 border border-zinc-200 p-1'
          />
        </div>
      ))}
    </div>
  );
  return await confirm(inputElements, {
    confirmMessage: options?.confirmMessage ?? 'Add',
    cancelMessage: options?.cancelMessage ?? 'Cancel',
  });
}
