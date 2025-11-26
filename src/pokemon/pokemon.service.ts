import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { isValidObjectId, Model } from 'mongoose';
import { Pokemon, PokemonDocument } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class PokemonService {
  constructor(
    @InjectModel(Pokemon.name)
    private readonly PokemonModel: Model<PokemonDocument>,
  ) {}

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLowerCase();
    try {
      const pokemon = await this.PokemonModel.create(createPokemonDto);
      return pokemon;
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  findAll(PaginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = PaginationDto;
    return this.PokemonModel.find().limit(limit).skip(offset).sort({ no: 1 });
  }

  async findOne(id: string): Promise<PokemonDocument> {
    let pokemon: PokemonDocument | null = null;
    if (!isNaN(+id)) {
      pokemon = await this.PokemonModel.findOne({ no: +id });
    }
    if (!pokemon && isValidObjectId(id)) {
      pokemon = await this.PokemonModel.findById(id);
    }
    if (!pokemon) {
      pokemon = await this.PokemonModel.findOne({
        name: id.toLowerCase().trim(),
      });
    }
    if (!pokemon)
      throw new NotFoundException(
        `Pokemon with id, name or no "${id}" not found`,
      );
    return pokemon;
  }

  async update(id: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne(id);
    if (updatePokemonDto.name)
      updatePokemonDto.name = updatePokemonDto.name.toLowerCase();
    try {
      await pokemon.updateOne(updatePokemonDto);
      return { ...pokemon.toJSON(), ...updatePokemonDto };
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async remove(id: string) {
    // const pokemon = await this.findOne(id);
    // await pokemon.deleteOne();
    // const result = this.PokemonModel.findByIdAndDelete(id);
    // return result;
    const { deletedCount } = await this.PokemonModel.deleteOne({ _id: id });
    if (deletedCount === 0)
      throw new BadRequestException(`Pokemon with id "${id}" not found`);
    return;
  }

  private handleExceptions(error: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (error.code === 11000) {
      throw new BadRequestException(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `Pokemon exists in db ${JSON.stringify(error.keyValue)}`,
      );
    }
    console.log(error);
    throw new InternalServerErrorException(
      `Can't create Pokemon - Check server logs`,
    );
  }
}
