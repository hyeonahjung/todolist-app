'use strict';

const categoryRepository = require('../repositories/category.repository');
const AppError = require('../errors/AppError');

function toDto(row) {
  return { categoryId: row.category_id, name: row.name, isDefault: row.is_default };
}

async function getCategories(userId) {
  const rows = await categoryRepository.findAll(userId);
  return rows.map(toDto);
}

async function createCategory(userId, { name }) {
  try {
    const row = await categoryRepository.create({ name, userId });
    console.log(`[${new Date().toISOString()}] [CATEGORY] created: categoryId=${row.category_id}, name="${name}", userId=${userId}`);
    return toDto(row);
  } catch (err) {
    if (err.code === '23505') throw new AppError(409, 'DUPLICATE_CATEGORY', '이미 존재하는 카테고리명입니다.');
    throw err;
  }
}

async function updateCategory(userId, categoryId, { name }) {
  const category = await categoryRepository.findById(categoryId);
  if (!category) throw new AppError(404, 'NOT_FOUND', '카테고리를 찾을 수 없습니다.');
  if (category.is_default) throw new AppError(403, 'FORBIDDEN', '기본 카테고리는 수정할 수 없습니다.');
  if (String(category.user_id) !== String(userId)) throw new AppError(404, 'NOT_FOUND', '카테고리를 찾을 수 없습니다.');

  try {
    const updated = await categoryRepository.updateById(categoryId, { name });
    console.log(`[${new Date().toISOString()}] [CATEGORY] updated: categoryId=${categoryId}, name="${name}", userId=${userId}`);
    return toDto(updated);
  } catch (err) {
    if (err.code === '23505') throw new AppError(409, 'DUPLICATE_CATEGORY', '이미 존재하는 카테고리명입니다.');
    throw err;
  }
}

async function deleteCategory(userId, categoryId) {
  const category = await categoryRepository.findById(categoryId);
  if (!category) throw new AppError(404, 'NOT_FOUND', '카테고리를 찾을 수 없습니다.');
  if (category.is_default) throw new AppError(403, 'FORBIDDEN', '기본 카테고리는 삭제할 수 없습니다.');
  if (String(category.user_id) !== String(userId)) throw new AppError(404, 'NOT_FOUND', '카테고리를 찾을 수 없습니다.');

  await categoryRepository.deleteById(categoryId);
  console.log(`[${new Date().toISOString()}] [CATEGORY] deleted: categoryId=${categoryId}, userId=${userId}`);
}

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
