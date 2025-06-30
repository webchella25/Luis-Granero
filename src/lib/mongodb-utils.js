// src/lib/mongodb-utils.js
import connectDB from './mongodb';

export async function findWithPagination(Model, filters = {}, options = {}) {
  await connectDB();
  
  const {
    page = 1,
    limit = 10,
    sort = { createdAt: -1 },
    select = '',
    populate = ''
  } = options;
  
  const skip = (page - 1) * limit;
  
  const [documents, total] = await Promise.all([
    Model.find(filters)
      .select(select)
      .populate(populate)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Model.countDocuments(filters)
  ]);
  
  return {
    documents,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1
    }
  };
}

export async function updateOrCreate(Model, filter, update, options = {}) {
  await connectDB();
  
  return Model.findOneAndUpdate(
    filter,
    { ...update, updatedAt: new Date() },
    { 
      upsert: true, 
      new: true,
      runValidators: true,
      ...options 
    }
  );
}

export async function bulkInsertWithValidation(Model, documents) {
  await connectDB();
  
  try {
    return await Model.insertMany(documents, { 
      ordered: false,
      rawResult: true 
    });
  } catch (error) {
    // Manejar errores de duplicados
    if (error.code === 11000) {
      console.warn('Algunos documentos ya existen:', error.writeErrors?.length || 0);
      return { insertedCount: documents.length - (error.writeErrors?.length || 0) };
    }
    throw error;
  }
}