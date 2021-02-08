import { Request, Response, NextFunction } from "express";
import { celebrate, Joi } from "celebrate";
import { UsersRepository } from "../../../../repositories/users.repostiory";
import { NotFoundError } from "../../../../errors/not-found.error";
import { StatusCodes } from "http-status-codes";

export interface GetUserIdActionProps {
  usersRepository: UsersRepository;
}

export const getUserIdActionValidation = celebrate(
  {
    query: Joi.object({
      username: Joi.string().required(),
    }).required(),
  },
  { abortEarly: false },
);

/**
 * @swagger
 *
 * /api/users/get-user-id:
 *   get:
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     description: Returns a user id by user name
 *     parameters:
 *       - in: query
 *         name: username
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: User Id
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                   example: 45287eff-cdb0-4cd4-8a0f-a07d1a11b382
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               $ref:  "#/definitions/BadRequestError"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref:  "#/definitions/UnauthorizedError"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref:  "#/definitions/NotFoundError"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref:  "#/definitions/InternalServerError"
 */
export const getUserIdAction = ({ usersRepository }: GetUserIdActionProps) => async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { username } = req.query as any;
  try {
    const userId = await usersRepository.getUserIdByUsername(username);

    if (!userId) {
      throw new NotFoundError("User not found");
    }
    return res.status(StatusCodes.OK).json({ userId });
  } catch (err) {
    return next(err);
  }
};
