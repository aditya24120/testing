import React from 'react';
import TagInput from './TagInput';
import TextArea from './TextArea';

type Props = {
  handleAddTag: (fieldName: string, value: string) => void;
  handleDeleteTag: (fieldName: string, value: string) => void;
  defaultList: string[];
  captionInput?: boolean;
  instagramCaption?: string;
  handleOnUpdate?: (fieldName: string, value: string) => void;
};

const InstagramSettings = ({
  handleAddTag,
  handleDeleteTag,
  defaultList,
  captionInput = false,
  instagramCaption,
  handleOnUpdate
}: Props) => {
  const tagsLength = defaultList.join(' ').length + defaultList.length;

  return (
    <div className="mb-6 flex flex-col gap-4">
      <h1 className="mb-2 border-b border-b-grey-200/40 text-lg font-semibold text-violet md:text-2xl">
        Instagram Settings
      </h1>

      {captionInput && (
        <TextArea
          id="caption"
          label="Caption"
          rows={8}
          value={instagramCaption || ''}
          onUpdate={(fieldName, value) => {
            if (handleOnUpdate) {
              handleOnUpdate(fieldName, value);
            }
          }}
          placeholder={'Tell viewers all about your video'}
          tagCount={tagsLength}
          maxLimit={2200}
        />
      )}
      <TagInput
        id="instagramHashtags"
        label="Hashtags"
        onUpdate={(fieldName, value) => handleAddTag(fieldName, value)}
        onDelete={handleDeleteTag}
        placeholder="hashtags"
        list={defaultList}
      />
    </div>
  );
};

export default InstagramSettings;
