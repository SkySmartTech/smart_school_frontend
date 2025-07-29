import React from 'react';
import { TextField, MenuItem, InputAdornment, useTheme, Box } from '@mui/material'; // Added useTheme and Box for icon wrapping

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
  const theme = useTheme(); // <--- IMPORTANT: Access the theme

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
            <Box sx={{ display: 'flex', alignItems: 'center', color: theme.palette.action.active }}>
              {icon}
            </Box>
          </InputAdornment>
        ) : null,
      }}
      sx={{
        minWidth: minWidth, // Apply the minWidth prop
        // --- IMPORTANT: Dynamic background color based on theme mode ---
        bgcolor: theme.palette.mode === 'dark' ? theme.palette.background.paper : 'white',

        "& .MuiOutlinedInput-root": {
          borderRadius: "10px", // Apply the border-radius from your example
          height: "45px", // Apply the height from your example
          // --- IMPORTANT: Use theme colors for borders ---
          '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider }, // Use theme.palette.divider or a specific gray
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main }, // Use primary color for focused
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.info.main }, // Use info color for hover, as per your original TeacherDashboard

          // Ensure the text color inside the input is correct
          '& .MuiInputBase-input': {
            color: theme.palette.text.primary,
          },
          // Ensure the dropdown arrow color is correct
          '& .MuiSelect-icon': {
            color: theme.palette.action.active, // Or theme.palette.text.secondary
          },
        },
        // Ensure the label color is correct
        '& .MuiInputLabel-root': {
          color: theme.palette.text.secondary,
        },
        // For the disabled state, ensure text and background are themed
        '&.Mui-disabled': {
            '& .MuiInputBase-input': {
                WebkitTextFillColor: theme.palette.text.disabled, // For webkit browsers
                color: theme.palette.text.disabled,
            },
            bgcolor: theme.palette.action.disabledBackground, // Background for disabled state
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