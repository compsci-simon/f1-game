import React from "react";

export const FrontWheel = (props: React.ComponentPropsWithoutRef<'div'>) => (
  <div {...props}>
    <svg width="13" height="12" viewBox="0 0 13 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 0H13V12H0V0Z" fill="black" />
    </svg>
  </div>
)

export const RearWheel = (props: React.ComponentPropsWithoutRef<'div'>) => (
  <div {...props}>
    <svg width="20" height="18" viewBox="0 0 20 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 0H20V18H0V0Z" fill="black" />
    </svg>
  </div>
)

export const CarFrame = (props: React.ComponentPropsWithoutRef<'div'>) => (
  <div {...props}>
    <svg width="100" height="101" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="51.5" y1="101" x2="51.5" y2="1" stroke="black" />
      <line y1="100.5" x2="100" y2="100.5" stroke="black" />
      <line x1="27" y1="0.5" x2="77" y2="0.5" stroke="black" />
    </svg>
  </div>
)

export default CarFrame
