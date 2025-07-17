import { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type FileWithPreview = File & {
  preview?: string;
};

interface FileUploaderProps {
  onUpload: (files: File[]) => void;
  accept?: Record<string, string[]>;
  maxSize?: number;
  multiple?: boolean;
  className?: string;
  disabled?: boolean;
  value?: File[];
}

export function FileUploader({
  onUpload,
  accept = {
    'video/*': ['.mp4', '.webm', '.mov'],
    'image/*': ['.jpg', '.jpeg', '.png', '.gif']
  },
  maxSize = 50 * 1024 * 1024, // 50MB
  multiple = true,
  className,
  disabled = false,
  value = []
}: FileUploaderProps) {
  const [files, setFiles] = useState<FileWithPreview[]>(value);

  // Clean up object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      files.forEach(file => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, [files]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = [...files, ...acceptedFiles.map(file => 
      Object.assign(file, {
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
      })
    )];
    setFiles(newFiles);
    onUpload(newFiles);
  }, [files, onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple,
    disabled
  });

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
    onUpload(newFiles);
  };

  return (
    <div className={className}>
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
          isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-2">
          <Upload className="h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {isDragActive
              ? 'Drop the files here'
              : 'Drag & drop files here, or click to select files'}
          </p>
          <p className="text-xs text-muted-foreground">
            Supported formats: {Object.values(accept).flat().join(', ')} • Max size: {maxSize / 1024 / 1024}MB
          </p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium">Selected Files ({files.length})</h4>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center space-x-3 truncate">
                  <div className="flex-shrink-0">
                    {file.preview ? (
                      <img
                        src={file.preview}
                        alt={file.name}
                        className="h-12 w-12 object-cover rounded"
                        onLoad={() => {
                          // Revoke the data uri to avoid memory leaks
                          if (file.preview) {
                            URL.revokeObjectURL(file.preview);
                          }
                        }}
                      />
                    ) : (
                      <div className="h-12 w-12 bg-muted rounded flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">
                          {file.name.split('.').pop()?.toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate" title={file.name}>
                      {file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Remove file</span>
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
