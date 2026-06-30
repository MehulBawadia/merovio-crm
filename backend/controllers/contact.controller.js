import { Contact } from "../models/Contact.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const index = asyncHandler(async (req, res) => {
  const { search, tag } = req.query;
  const filter = { owner: req.user._id };

  if (tag) filter.tags = tag;
  if (search) {
    const searchValue = new RegExp(search, "i");
    filter.$or = [
      { name: searchValue },
      { email: searchValue },
      { company: searchValue },
    ];
  }

  const contacts = await Contact.find(filter).sort({ favorite: -1, name: 1 });
  res.json({ success: true, count: contacts.length, contacts });
});

export const store = asyncHandler(async (req, res) => {
  const contact = await Contact.create({ ...req.body, owner: req.user._id });
  res.status(201).json({ success: true, contact });
});

export const show = asyncHandler(async (req, res) => {
  const contact = await Contact.findOne({
    _id: req.params.id,
    owner: req.user._id,
  });
  if (!contact)
    throw new ApiError(404, "Contact not found with the provided id.");

  res.json({ success: true, contact });
});

export const update = asyncHandler(async (req, res) => {
  const { owner, ...updates } = req.body;

  const contact = await Contact.findOneAndUpdate(
    { _id: req.params.id, owner: req.user._id },
    updates,
    { new: true, runValidators: true },
  );
  if (!contact)
    throw new ApiError(404, "Contact not found with the provided id.");

  res.json({ success: true, contact });
});

export const destroy = asyncHandler(async (req, res) => {
  const contact = await Contact.findOneAndDelete({
    _id: req.params.id,
    owner: req.user._id,
  });
  if (!contact)
    throw new ApiError(404, "Contact not found with the provided id.");

  res.json({ success: true, message: "Contact successfully destroyed" });
});
