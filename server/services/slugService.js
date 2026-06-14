const slugify = require('slugify');





const generateSlug = async (name, Model) => {
  let slug = slugify(name, { lower: true, strict: true });

  
  const existing = await Model.findOne({ slug });
  if (!existing) return slug;

  
  let counter = 1;
  while (true) {
    const candidate = `${slug}-${counter}`;
    const conflict = await Model.findOne({ slug: candidate });
    if (!conflict) return candidate;
    counter++;
  }
};

module.exports = { generateSlug };
