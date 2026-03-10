import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { message, Upload } from 'antd';
import type { RcFile, UploadChangeParam } from 'antd/es/upload';
import { useState } from 'react';
import { getAccessToken, SERVER_URL } from '../lib/api';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE_MB = 5;

interface ImageUploadProps {
  /** Current image URL (for edit mode or after upload) */
  value?: string;
  /** Callback when image URL changes */
  onChange?: (url: string | undefined) => void;
  /** Placeholder text */
  hint?: string;
}

function beforeUpload(file: RcFile) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    message.error('Chỉ chấp nhận file ảnh (JPEG, PNG, WebP, GIF)');
    return Upload.LIST_IGNORE;
  }
  if (file.size / 1024 / 1024 > MAX_SIZE_MB) {
    message.error(`File phải nhỏ hơn ${MAX_SIZE_MB}MB`);
    return Upload.LIST_IGNORE;
  }
  return true;
}

/**
 * Reusable image upload component.
 * Wraps Ant Design Upload, calls backend /upload/image, returns URL.
 * Compatible with Ant Design Form via value/onChange props.
 */
export default function ImageUpload({ value, onChange, hint }: ImageUploadProps) {
  const [loading, setLoading] = useState(false);
  const apiBaseUrl = `${SERVER_URL}/api`;

  const handleChange = (info: UploadChangeParam) => {
    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }
    if (info.file.status === 'done') {
      setLoading(false);
      const url = info.file.response?.url;
      if (url) {
        // Construct full URL for display
        const fullUrl = url.startsWith('http') ? url : `${SERVER_URL}${url}`;
        onChange?.(fullUrl);
      }
    }
    if (info.file.status === 'error') {
      setLoading(false);
      message.error('Upload thất bại. Vui lòng thử lại.');
    }
  };

  return (
    <Upload
      name="file"
      listType="picture-card"
      showUploadList={false}
      action={`${apiBaseUrl}/upload/image`}
      headers={{ Authorization: `Bearer ${getAccessToken() ?? ''}` }}
      beforeUpload={beforeUpload}
      onChange={handleChange}
    >
      {value ? (
        <img
          src={value}
          alt="preview"
          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }}
        />
      ) : (
        <div style={{ textAlign: 'center' }}>
          {loading ? <LoadingOutlined /> : <PlusOutlined />}
          <div style={{ marginTop: 8, fontSize: 12 }}>{hint || 'Tải ảnh lên'}</div>
        </div>
      )}
    </Upload>
  );
}
