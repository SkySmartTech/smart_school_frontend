
import React from 'react';
import { FormControl, Select, MenuItem, Typography, Box } from '@mui/material'; // Removed InputLabel

interface FilterDropdownProps {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
  minWidth?: number;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({ label, value, options, onChange }) => {
  return (
    <Box>
      <Typography variant="body2" sx={{ mb: 0.3, color: '#0B2347' }}>{label}</Typography>
      <FormControl sx={{ minWidth: 250, bgcolor: 'white', borderRadius: '4px' }} size="small">
        <Select
          value={value}
          onChange={(e) => onChange(e.target.value as string)}
          displayEmpty
          inputProps={{ 'aria-label': label }}
          sx={{
            '.MuiOutlinedInput-notchedOutline': { borderColor: '#A9A9A9' },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#0B2347' },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#0B2347' },
          }}
        >
          <MenuItem value="">
            <em>{`Select ${label}`}</em>
          </MenuItem>
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default FilterDropdown;