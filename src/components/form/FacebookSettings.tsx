import React from 'react';
import TextArea from './TextArea';

type Props = {
  description?: string;
  handleOnUpdate: (fieldName: string, value: string) => void;
};

export const FacebookSettings = ({ description, handleOnUpdate }: Props) => {
  return (
    <div className="mb-6 flex flex-col gap-4">
      <h1 className="mb-2 border-b border-b-grey-200/40 text-lg font-semibold text-violet md:text-2xl">
        Facebook Settings
      </h1>

      <TextArea
        id="facebookDescription"
        label="Description"
        rows={4}
        value={description || ''}
        onUpdate={(fieldName, value) => {
          if (handleOnUpdate) {
            handleOnUpdate(fieldName, value);
          }
        }}
        placeholder={'Tell viewers all about your video'}
      />
    </div>
  );
};
