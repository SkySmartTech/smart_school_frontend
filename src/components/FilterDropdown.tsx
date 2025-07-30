import React from 'react';
import { TextField, MenuItem, InputAdornment } from '@mui/material'; // Updated imports for TextField select

interface FilterDropdownProps {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
  minWidth?: number; // Optional minWidth for the component
  disabled?: boolean;
  icon?: React.ReactNode; // Optional icon to display inside the field
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  label,
  value,
  options,
  onChange,
  disabled = false,
  icon,
  minWidth = 250, // Default minWidth if not provided
}) => {
  return (
    <TextField
      select // This prop makes the TextField behave as a select dropdown
      label={label} // The label will float above the field
      value={value}
      onChange={(e) => onChange(e.target.value as string)}
      variant="outlined" // Ensures the outlined border style
      size="small" // Keeps the compact size
      disabled={disabled}
      InputProps={{
        // This places the icon inside the input field at the start
        startAdornment: icon ? (
          <InputAdornment position="start" sx={{ mr: 0.5 }}>
            {icon}
          </InputAdornment>
        ) : null,
      }}
      sx={{
        minWidth: minWidth, // Apply the minWidth prop
        bgcolor: 'white', // Background color for the input field
        // Styles applied to the root of the OutlinedInput (the actual input element)
        "& .MuiOutlinedInput-root": {
          borderRadius: "10px", // Apply the border-radius from your example
          height: "45px", // Apply the height from your example
          // Existing border color styles for different states
          '& .MuiOutlinedInput-notchedOutline': { borderColor: '#A9A9A9' },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#0B2347' },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#0B2347' },
        },
      }}
    >
      {/* Default "Select" option */}
      <MenuItem value="">
        <em>{`Select ${label}`}</em>
      </MenuItem>
      {/* Map through options to create MenuItem components */}
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default FilterDropdown;
