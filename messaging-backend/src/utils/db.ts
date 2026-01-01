import mongoose from 'mongoose';

// Check if document exists
export const documentExists = async (model: any, id: string): Promise<boolean> => {
  try {
    const doc = await model.findById(id);
    return !!doc;
  } catch (error) {
    return false;
  }
};

// Paginate query
export const paginate = (page: number = 1, limit: number = 20) => {
  const skip = (page - 1) * limit;
  return { skip, limit };
};

// Convert string to ObjectId
export const toObjectId = (id: string): mongoose.Types.ObjectId => {
  return new mongoose.Types.ObjectId(id);
};

// Check if valid ObjectId
export const isValidObjectId = (id: string): boolean => {
  return mongoose.Types.ObjectId.isValid(id);
};