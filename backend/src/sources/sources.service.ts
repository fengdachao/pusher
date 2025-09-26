import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Source } from './source.entity';

@Injectable()
export class SourcesService {
  constructor(
    @InjectRepository(Source)
    private sourcesRepository: Repository<Source>,
  ) {}

  async findAll(): Promise<Source[]> {
    return this.sourcesRepository.find({
      where: { enabled: true },
      order: { name: 'ASC' },
    });
  }

  async findByCode(code: string): Promise<Source | null> {
    return this.sourcesRepository.findOne({ where: { code } });
  }

  async findById(id: string): Promise<Source | null> {
    return this.sourcesRepository.findOne({ where: { id } });
  }

  async create(sourceData: Partial<Source>): Promise<Source> {
    const source = this.sourcesRepository.create(sourceData);
    return this.sourcesRepository.save(source);
  }
}