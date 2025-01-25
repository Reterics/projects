import {useState} from 'react';
import {BsType} from 'react-icons/bs';

export interface DropdownOption {
  value: string | number;
  icon: React.ReactNode;
  label: string;
}
export interface DropdownProps {
  options: DropdownOption[];
  value: string | number;
  className?: string;
  onSelect: (value: string | number) => void;
}

export default function Dropdown({
  options,
  value,
  className,
  onSelect,
}: Readonly<DropdownProps>) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (value: string | number) => {
    setIsOpen(false);
    onSelect(value);
  };

  return (
    <div className='relative inline-block'>
      <button className={className} onClick={() => setIsOpen(!isOpen)}>
        {options.find((opt) => opt.value === value)?.icon || <BsType />}
      </button>

      {isOpen && (
        <div className='absolute right-0 mt-2 w-56 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-10'>
          {options.map(({value, icon, label}) => (
            <button
              key={value}
              className='flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
              onClick={() => handleSelect(value)}
            >
              <span className='mr-3 text-xl'>{icon}</span>
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
