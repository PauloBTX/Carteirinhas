import os
import glob
from PIL import Image

def generate_pdf(image_paths, output_path):
    # Dimensões da folha A4 em modo retrato (Portrait)
    # A4 = 210mm x 297mm
    # A 300 DPI (dots per inch):
    # 210mm = 8.27 polegadas * 300 = 2480 pixels
    # 297mm = 11.69 polegadas * 300 = 3508 pixels
    a4_width = 2480
    a4_height = 3508
    
    # Criar folha A4 em branco (fundo branco)
    bg = Image.new('RGB', (a4_width, a4_height), 'white')
    
    # Largura máxima = 200 mm, Altura = 75 mm
    # 200 mm / 25.4 * 300 = 2362 pixels
    # 75 mm / 25.4 * 300 = 885 pixels
    max_img_width = 2362
    max_img_height = 885
    
    # Espaço vertical total caso usemos 3 imagens com essa altura
    # 3 * 885 = 2655 pixels
    # Restante: 3508 - 2655 = 853 pixels
    # Dividir restante em 4 margens iguais (topo, duas entre imagens, e base) para dar o espaço para corte
    margin_y = 853 // 4 # ~= 213 pixels
    
    # Centralização horizontal: (2480 - 2457) // 2 = 11 pixels
    x_offset = (a4_width - max_img_width) // 2
    
    y_offset = margin_y
    for path in image_paths:
        try:
            img = Image.open(path).convert("RGB")
            
            # Força o redimensionamento exato para 208mm x 76mm a 300 DPI
            img = img.resize((max_img_width, max_img_height), Image.Resampling.LANCZOS)
            
            # Cola a imagem sobre o fundo branco (A4 Retrato)
            bg.paste(img, (x_offset, y_offset))
            
            # Atualiza o y_offset para a próxima imagem (desloca pela altura mais o espaçamento de corte)
            y_offset += max_img_height + margin_y
        except Exception as e:
            print(f"Erro ao processar a imagem {path}: {e}")
            
    # Salvar o canvas inteiro como página PDF
    bg.save(output_path, "PDF", resolution=300.0)
    print(f"Gerado: {output_path}")

def main():
    # Diretórios
    base_dir = os.path.join("dist", "images", "carteirinhasgeradas")
    output_dir = os.path.join(base_dir, "imprimir")
    
    # Cria diretório destino se não existir
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        print(f"Diretório criado: {output_dir}")
        
    # Buscar arquivos (jpg, png)
    search_pattern = os.path.join(base_dir, "*.*")
    all_files = glob.glob(search_pattern)
    
    valid_images = []
    for file in all_files:
        # Se for um diretorio, ignora
        if os.path.isdir(file):
            continue
            
        name = os.path.basename(file).lower()
        
        # Ignora se contém "problema" e filtra pela extensão da imagem
        if "problema" not in name and (name.endswith(".jpg") or name.endswith(".jpeg") or name.endswith(".png")):
            valid_images.append(file)
            
    # Ordenar pelos nomes para facilitar na hora de imprimir os lotes
    valid_images.sort()
    
    if len(valid_images) == 0:
        print(f"Nenhuma imagem válida (sem 'problema') encontrada em: {base_dir}")
        return
    
    # Processar de 3 em 3
    chunk_size = 3
    for i in range(0, len(valid_images), chunk_size):
        chunk = valid_images[i:i + chunk_size]
        
        # Nomeia o arquivo do lote
        lote_num = (i // chunk_size) + 1
        output_file = os.path.join(output_dir, f"impressao_lote_{lote_num:03d}.pdf")
        
        generate_pdf(chunk, output_file)
        
    print(f"\n--- Processamento concluído! ---")
    print(f"Total processadas: {len(valid_images)} imagens.")
    print(f"Total de PDFs gerados: {(len(valid_images) + chunk_size - 1) // chunk_size}")

if __name__ == "__main__":
    main()
