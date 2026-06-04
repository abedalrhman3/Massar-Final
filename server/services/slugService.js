const slugify = require('slugify');

// -------------------------------------------------------
// Generate a unique slug for a given model
// If "dead-sea" already exists, it becomes "dead-sea-1"
// -------------------------------------------------------
const generateSlug = async (name, Model) => {
  let slug = slugify(name, { lower: true, strict: true });

  // Check if slug already exists
  const existing = await Model.findOne({ slug });
  if (!existing) return slug;

  // If it exists, append a number and keep trying until unique
  let counter = 1;
  while (true) {
    const candidate = `${slug}-${counter}`;
    const conflict = await Model.findOne({ slug: candidate });
    if (!conflict) return candidate;
    counter++;
  }
};

module.exports = { generateSlug };
