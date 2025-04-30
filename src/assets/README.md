# Assets Directory

This directory contains all static assets for the MED Clinic application.

## Structure

- `images/`: Contains all image files used in the application
- `icons/`: Contains all icon files used in the application
- `fonts/`: Contains all font files used in the application

## Guidelines

### Images

- Use SVG format whenever possible for better scaling
- Optimize images for web using tools like [TinyPNG](https://tinypng.com/) or [Squoosh](https://squoosh.app/)
- Use descriptive filenames (e.g., `hero-banner.jpg`, `profile-placeholder.png`)
- Keep image sizes reasonable (< 200KB for most images)

### Icons

- Use SVG format for icons
- Follow a consistent naming convention (e.g., `icon-{name}.svg`)
- Consider using icon fonts or SVG sprites for better performance

### Fonts

- Include only the font weights and styles that are actually used
- Consider using variable fonts for better performance
- Include appropriate fallbacks in the CSS
- Use web-safe fonts when possible

## Adding New Assets

When adding new assets:

1. Place them in the appropriate directory
2. Optimize them for web use
3. Use descriptive filenames
4. Update this README if necessary
