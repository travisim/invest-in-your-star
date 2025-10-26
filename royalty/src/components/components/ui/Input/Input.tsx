import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = ({ label, ...props }: InputProps) => {
  return (
    <div className="form-control">
      {label && <label>{label}</label>}
      <input {...props} />
    </div>
  );
};
