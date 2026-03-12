import { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Image as KonvaImage, Text, Group, Transformer } from 'react-konva';
import useImage from 'use-image';
import QRCode from 'qrcode';
import { Student } from '../types';
import { Download, AlertTriangle, Upload } from 'lucide-react';

interface CardEditorProps {
    student: Student;
    onUpdateStudent: (updated: Student) => void;
    dirHandle?: any;
}

export function CardEditor({ student, onUpdateStudent, dirHandle }: CardEditorProps) {
    // Load background template
    const [bgImage] = useImage(`${import.meta.env.BASE_URL}input/CARTEIRINHA 2026 MODELO.png`);

    // Try loading student photo using various extensions
    const [photoUrl, setPhotoUrl] = useState(`${import.meta.env.BASE_URL}images/Fotos Projeto Social/${student.cpfLimpo}.jpg`);
    const [photoImage, status] = useImage(photoUrl);

    const stageRef = useRef<any>(null);
    const photoRef = useRef<any>(null);
    const trRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const localBlobUrlRef = useRef<string | null>(null);

    const handleLocalPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        if (localBlobUrlRef.current) {
            URL.revokeObjectURL(localBlobUrlRef.current);
        }
        
        const objectUrl = URL.createObjectURL(file);
        localBlobUrlRef.current = objectUrl;
        setPhotoUrl(objectUrl);
        
        // Clear value so the same file can be selected again if needed
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const [isSelected, setIsSelected] = useState(false);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0, scale: 1 });

    // Handle responsive sizing
    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current && bgImage) {
                const containerWidth = containerRef.current.offsetWidth;
                const containerHeight = containerRef.current.offsetHeight;

                // Calculate scale to fit within container
                const scaleX = containerWidth / bgImage.width;
                const scaleY = containerHeight / bgImage.height;
                const scale = Math.min(scaleX, scaleY, 1); // Don't scale up past 1x

                setDimensions({
                    width: bgImage.width * scale,
                    height: bgImage.height * scale,
                    scale: scale
                });
            }
        };

        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, [bgImage]);

    // Try fallback to .png and .webp if .jpg fails
    useEffect(() => {
        if (status === 'failed') {
            if (photoUrl.endsWith('.jpg')) {
                setPhotoUrl(`${import.meta.env.BASE_URL}images/Fotos Projeto Social/${student.cpfLimpo}.png`);
            } else if (photoUrl.endsWith('.png')) {
                setPhotoUrl(`${import.meta.env.BASE_URL}images/Fotos Projeto Social/${student.cpfLimpo}.webp`);
            }
        }
    }, [status, photoUrl, student.cpfLimpo]);

    // Reset photo URL when a new student is selected
    useEffect(() => {
        if (localBlobUrlRef.current) {
            URL.revokeObjectURL(localBlobUrlRef.current);
            localBlobUrlRef.current = null;
        }
        setPhotoUrl(`${import.meta.env.BASE_URL}images/Fotos Projeto Social/${student.cpfLimpo}.jpg`);
        setIsSelected(false);
    }, [student.cpfLimpo]);

    // Handle QR code generation
    const [qrImage, setQrImage] = useState<HTMLImageElement | null>(null);

    useEffect(() => {
        let isMounted = true;
        if (student.matricula && student.matricula !== "Pendente") {
            QRCode.toDataURL(student.matricula, { margin: 0, width: 236 })
                .then(url => {
                    const img = new window.Image();
                    img.src = url;
                    img.onload = () => {
                        if (isMounted) setQrImage(img);
                    };
                })
                .catch(err => {
                    console.error("QR Code error:", err);
                    if (isMounted) setQrImage(null);
                });
        } else {
            setQrImage(null);
        }
        return () => {
            isMounted = false;
        };
    }, [student.matricula]);

    useEffect(() => {
        if (isSelected && trRef.current && photoRef.current) {
            trRef.current.nodes([photoRef.current]);
            trRef.current.getLayer().batchDraw();
        }
    }, [isSelected]);

    const handleDragEnd = () => {
        // Keep internal state if we need it
    };

    const checkDeselect = (e: any) => {
        // deselect when clicked on empty area or background
        const clickedOnEmpty = e.target === e.target.getStage() || e.target.name() === 'background';
        if (clickedOnEmpty) {
            setIsSelected(false);
        }
    };

    const saveFile = async (dataUrl: string, filename: string, isProblem: boolean) => {
        if (dirHandle) {
            try {
                const fileHandle = await dirHandle.getFileHandle(filename, { create: true });
                const writable = await fileHandle.createWritable();
                const response = await fetch(dataUrl);
                const blob = await response.blob();
                await writable.write(blob);
                await writable.close();
                onUpdateStudent({ ...student, gerada: !isProblem, problema: isProblem });
                return;
            } catch (e) {
                console.error("Falha ao salvar silenciosamente via File System API", e);
                // Fallthrough
            }
        }

        // Fallback for browsers that don't support it or if no folder is selected
        const link = document.createElement('a');
        link.download = filename;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        onUpdateStudent({ ...student, gerada: !isProblem, problema: isProblem });
    };

    const handleExport = () => {
        if (!stageRef.current) return;
        setIsSelected(false);
        setTimeout(() => {
            const uri = stageRef.current.toDataURL({ pixelRatio: 2, mimeType: "image/jpeg" });
            saveFile(uri, `${student.cpfLimpo}.jpg`, false);
        }, 100);
    };

    const handleProblemExport = () => {
        if (!stageRef.current) return;
        setIsSelected(false);
        setTimeout(() => {
            const uri = stageRef.current.toDataURL({ pixelRatio: 2, mimeType: "image/jpeg" });
            saveFile(uri, `${student.cpfLimpo}_problema.jpg`, true);
        }, 100);
    };

    const handleChange = (field: keyof Student, value: string) => {
        onUpdateStudent({ ...student, [field]: value });
    };

    return (
        <div className="flex flex-col md:flex-row gap-8 w-full">
            {/* Editor Panel */}
            <div className="w-full md:w-80 space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Editar Dados</h3>

                <div className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
                            value={student.nome}
                            onChange={(e) => handleChange('nome', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Matrícula</label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
                            value={student.matricula}
                            onChange={(e) => handleChange('matricula', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Data Nasc.</label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
                            value={student.dataNascimento}
                            onChange={(e) => handleChange('dataNascimento', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Modalidade</label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
                            value={student.modalidade}
                            onChange={(e) => handleChange('modalidade', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Horário</label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
                            value={student.horario}
                            onChange={(e) => handleChange('horario', e.target.value)}
                        />
                    </div>
                </div>

                <div className="pt-4 flex flex-col gap-3">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 font-medium py-2.5 px-4 rounded-md shadow-sm flex items-center justify-center gap-2"
                    >
                        <Upload className="w-5 h-5" />
                        Carregar Foto Manual
                    </button>
                    <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        ref={fileInputRef} 
                        onChange={handleLocalPhotoUpload} 
                    />

                    <button
                        onClick={handleExport}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-md shadow-sm flex items-center justify-center gap-2"
                    >
                        <Download className="w-5 h-5" />
                        Salvar JPG ({student.cpfLimpo}.jpg)
                    </button>

                    <button
                        onClick={handleProblemExport}
                        className="w-full bg-orange-100 hover:bg-orange-200 text-orange-700 border border-orange-300 font-medium py-2.5 px-4 rounded-md shadow-sm flex items-center justify-center gap-2"
                    >
                        <AlertTriangle className="w-5 h-5" />
                        Marcar Problema
                    </button>
                </div>
            </div>

            {/* Canvas Preview */}
            <div
                className="flex-1 bg-gray-100 rounded-lg border border-gray-200 p-4 flex items-center justify-center min-h-[600px]"
                ref={containerRef}
            >
                {bgImage ? (
                    <div className="shadow-lg bg-white">
                        <Stage
                            width={dimensions.width || bgImage.width}
                            height={dimensions.height || bgImage.height}
                            scaleX={dimensions.scale}
                            scaleY={dimensions.scale}
                            ref={stageRef}
                            onMouseDown={checkDeselect}
                            onTouchStart={checkDeselect}
                        >
                            <Layer>
                                <KonvaImage image={bgImage} name="background" />

                                {/* Text Fields */}
                                <Text x={165} y={223} width={500} height={45} verticalAlign="middle" text={student.nome} fontSize={26} fontFamily="Arial" fill="#000" fontStyle="bold" />
                                <Text x={214} y={279} width={280} height={45} verticalAlign="middle" text={student.matricula} fontSize={22} fontFamily="Arial" fill="#000" />
                                <Text x={519} y={279} width={250} height={45} verticalAlign="middle" text={student.dataNascimento} fontSize={22} fontFamily="Arial" fill="#000" />
                                <Text x={238} y={332} width={500} height={45} verticalAlign="middle" text={student.modalidade} fontSize={22} fontFamily="Arial" fill="#000" />
                                <Text x={175} y={383} width={500} height={45} verticalAlign="middle" text={student.horario} fontSize={22} fontFamily="Arial" fill="#000" />

                                <Text x={333} y={434} width={200} height={45} verticalAlign="middle" text="fev/2026" fontSize={22} fontFamily="Arial" fill="#000" />
                                <Text x={333} y={487} width={200} height={45} verticalAlign="middle" text="jan/2027" fontSize={22} fontFamily="Arial" fill="#000" />

                                {/* QR Code Generator */}
                                {qrImage && (
                                    <KonvaImage
                                        image={qrImage}
                                        x={1413}
                                        y={167}
                                        width={236}
                                        height={236}
                                    />
                                )}

                                {/* Photo Clipping Group: Top-Right */}
                                <Group
                                    x={800}
                                    y={38}
                                    clipFunc={(ctx) => {
                                        ctx.rect(0, 0, 180, 270);
                                    }}
                                >
                                    {status === 'loading' && <Text text="Carregando..." x={30} y={130} fontSize={16} fill="gray" />}
                                    {status === 'failed' && <Text text="Foto não\nencontrada" x={45} y={120} fontSize={14} fill="red" align="center" />}
                                    {photoImage && (
                                        <KonvaImage
                                            ref={photoRef}
                                            image={photoImage}
                                            x={0}
                                            y={0}
                                            width={180}
                                            height={270}
                                            draggable
                                            onDragEnd={handleDragEnd}
                                            onClick={() => setIsSelected(true)}
                                            onTap={() => setIsSelected(true)}
                                        />
                                    )}
                                </Group>

                                {isSelected && (
                                    <Transformer
                                        ref={trRef}
                                        boundBoxFunc={(oldBox, newBox) => {
                                            if (Math.abs(newBox.width) < 10 || Math.abs(newBox.height) < 10) {
                                                return oldBox;
                                            }
                                            return newBox;
                                        }}
                                    />
                                )}
                            </Layer>
                        </Stage>
                    </div>
                ) : (
                    <div className="text-gray-500">Caregando template...</div>
                )}
            </div>
        </div>
    );
}
