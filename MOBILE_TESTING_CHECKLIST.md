# Mobile Testing Checklist

## ✅ Features to Test

### Admin Panel

#### Navigation
- [ ] Hamburger menu appears on mobile (< 1024px)
- [ ] Clicking hamburger opens sidebar
- [ ] Clicking backdrop closes sidebar
- [ ] Clicking X button closes sidebar
- [ ] Clicking nav item closes sidebar and navigates
- [ ] Sidebar slides smoothly with animation

#### Dashboard Page
- [ ] Stats cards stack vertically on mobile
- [ ] All text is readable
- [ ] Cards have proper spacing
- [ ] Table scrolls horizontally if needed

#### Domains Page
- [ ] Header stacks on mobile
- [ ] Add button is full-width
- [ ] Table scrolls horizontally
- [ ] Modal is full-screen on mobile
- [ ] Modal closes on backdrop click
- [ ] Form inputs are properly sized (no zoom on iOS)

#### Batches Page
- [ ] Title and domain filter stack vertically
- [ ] Add button is full-width
- [ ] Table scrolls horizontally
- [ ] Modal is full-screen on mobile
- [ ] Modal closes on backdrop click
- [ ] Date inputs work properly on mobile

#### Students Page
- [ ] Search bar is full-width
- [ ] Domain and batch filters stack
- [ ] Add button is full-width
- [ ] Table scrolls horizontally
- [ ] Domain and batch names display (not IDs)
- [ ] Modal is full-screen on mobile
- [ ] Modal closes on backdrop click

#### Sessions Page
- [ ] Form and preview stack vertically
- [ ] Batch dropdown loads dynamically
- [ ] All inputs are touch-friendly
- [ ] Generated code is visible
- [ ] Sessions table scrolls horizontally

### Student Panel

#### Dashboard
- [ ] Navigation wraps on mobile
- [ ] Attendance grid stacks vertically
- [ ] Code input is full-width
- [ ] Submit button is full-width
- [ ] Session cards are readable
- [ ] Percentage display is clear

#### Certificates
- [ ] Card is centered and readable
- [ ] Icons display properly
- [ ] Download button is accessible
- [ ] Text is properly sized

### Login Page
- [ ] Form is centered
- [ ] Inputs are properly sized
- [ ] Button is full-width on mobile
- [ ] No zoom on input focus (iOS)

## 📱 Device Testing

### Screen Sizes
- [ ] iPhone SE (375px)
- [ ] iPhone 12/13 (390px)
- [ ] iPhone 14 Pro Max (430px)
- [ ] iPad Mini (768px)
- [ ] iPad Pro (1024px)
- [ ] Android phones (360px - 412px)

### Orientations
- [ ] Portrait mode
- [ ] Landscape mode

### Browsers
- [ ] Safari (iOS)
- [ ] Chrome (Android)
- [ ] Chrome (iOS)
- [ ] Firefox (Mobile)
- [ ] Samsung Internet

## 🎯 Interaction Testing

### Touch Targets
- [ ] All buttons are at least 44x44px
- [ ] Proper spacing between clickable elements
- [ ] No accidental clicks

### Forms
- [ ] Inputs don't zoom on focus (iOS)
- [ ] Keyboard doesn't cover inputs
- [ ] Submit buttons are accessible
- [ ] Validation messages are visible

### Scrolling
- [ ] Smooth scrolling
- [ ] Tables scroll horizontally
- [ ] No horizontal page scroll
- [ ] Proper momentum scrolling

### Modals
- [ ] Full-screen on mobile
- [ ] Close on backdrop click
- [ ] Close button is accessible
- [ ] Content is scrollable if needed

## 🚀 Performance

- [ ] Page loads quickly
- [ ] No layout shifts
- [ ] Smooth animations
- [ ] No lag on interactions
- [ ] Images load properly

## ♿ Accessibility

- [ ] Proper contrast ratios
- [ ] Touch targets are large enough
- [ ] Focus states are visible
- [ ] Screen reader compatible
- [ ] Keyboard navigation works

## 🐛 Known Issues to Verify Fixed

- [x] Sessions page batch dropdown was hardcoded
- [x] Student table showed IDs instead of names
- [x] No mobile menu for admin panel
- [x] Modals didn't close on backdrop click
- [x] Tables didn't scroll on mobile
- [x] Forms weren't mobile-friendly
- [x] No viewport meta tag
- [x] Inputs caused zoom on iOS

## 📝 Notes

### Test on Real Devices
- Emulators are good but not perfect
- Test on actual iOS and Android devices
- Check different OS versions

### Network Conditions
- Test on slow 3G
- Test on WiFi
- Test offline behavior

### Edge Cases
- Very long names/emails
- Empty states
- Error states
- Loading states

---

**Testing Priority**: High
**Estimated Time**: 2-3 hours for comprehensive testing
**Status**: Ready for testing
