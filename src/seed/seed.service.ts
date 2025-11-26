import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { PokeResponse } from './interfaces/poke-response.interfaces';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { AxiosAdaptar } from 'src/common/adapters/axios.adapter';

@Injectable()
export class SeedService {
  private readonly axios: AxiosInstance = axios;
  // constructor
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModule: Model<Pokemon>,
    private readonly http: AxiosAdaptar,
  ) {}
  async executeSeed() {
    // delete * from pokemons
    await this.pokemonModule.deleteMany({});
    // api pokemon
    const data = await this.http.get<PokeResponse>(
      'https://pokeapi.co/api/v2/pokemon?limit=650',
    );
    // console.log(data);
    // const insertPromisesArrays: Promise<PokemonModule>[] = [];
    const pokemonToInset: { name: string; no: number }[] = [];
    data.results.forEach(({ name, url }) => {
      const segments = url.split('/');
      const no = +segments[segments.length - 2];
      // console.log({ name, no });
      // insertPromisesArrays.push(this.pokemonModule.create({ name, no }));
      pokemonToInset.push({ name, no });
    });
    // await Promise.all(insertPromisesArrays);
    await this.pokemonModule.insertMany(pokemonToInset);
    // console.log({ name, url, pokemonDetails: pokemonDetails.data });
    // return 'This action seeds the database';
    return 'Seed executed';
  }
}
